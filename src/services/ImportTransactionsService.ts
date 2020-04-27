import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface InputTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: { filename: string }): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);
    const hasFile = fs.existsSync(filePath);
    if (!hasFile) {
      throw new AppError('File not included for processing');
    }
    const readCSVStream = fs.createReadStream(filePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);
    const createTransactionService = new CreateTransactionService();

    const transactionsProccesed: InputTransaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;
      if (title && type && value) {
        const transaction = {
          title,
          type,
          value,
          category,
        };

        transactionsProccesed.push(transaction);
      }
    });

    // Catch any error
    parseCSV.on('error', err => {
      throw new AppError(err.message);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    for (const transaction of transactionsProccesed) {
      const trans = await createTransactionService.execute({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transaction.category,
      });
      transactions.push(trans);
    }

    parseCSV.end();
    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
