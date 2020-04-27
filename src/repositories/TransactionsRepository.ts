import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeTransactions = await this.find({ where: { type: 'income' } });
    const outcomeTransactions = await this.find({ where: { type: 'outcome' } });

    const incomeValue = incomeTransactions.reduce(
      (previousValue, transaction) => {
        if (transaction.type === 'income') {
          return previousValue + transaction.value;
        }
        return previousValue;
      },
      0,
    );

    const outcomeValue = outcomeTransactions.reduce(
      (previousValue, transaction) => {
        if (transaction.type === 'outcome') {
          return previousValue + transaction.value;
        }
        return previousValue;
      },
      0,
    );

    return {
      income: incomeValue,
      outcome: outcomeValue,
      total: incomeValue - outcomeValue,
    };
  }
}

export default TransactionsRepository;
