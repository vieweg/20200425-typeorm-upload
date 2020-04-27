import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const trasaction = await transactionRepository.findOne(id);
    if (!trasaction) {
      throw new AppError('Transaction not found', 400);
    }

    await transactionRepository.remove(trasaction);
  }
}

export default DeleteTransactionService;
