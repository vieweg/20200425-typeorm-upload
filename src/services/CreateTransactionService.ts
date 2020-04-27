import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const balance = await transactionRepository.getBalance();

    if (type !== 'outcome' && type !== 'income') {
      throw new AppError('Type submited is not valid.');
    }

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Saldo insuficiente para executar a operação.');
    }

    let categoryAssigned = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryAssigned) {
      categoryAssigned = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryAssigned);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryAssigned.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
