import mongoose from 'mongoose';

/**
 * Executes a callback within a Mongoose transaction.
 * If the connected MongoDB database is a standalone instance (which doesn't support transactions),
 * it will automatically fall back to running the operations without a session.
 */
export const runInTransaction = async <T>(
  callback: (session: mongoose.ClientSession | null) => Promise<T>,
): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    // Detect standalone MongoDB server that does not support transactions
    const isStandaloneError =
      error.message?.includes('Transaction numbers are only allowed') ||
      error.codeName === 'TransactionSystemFailed' ||
      error.message?.includes('replica set');

    if (isStandaloneError) {
      // Graceful fallback: execute operations without a transaction session
      return callback(null);
    }

    throw error;
  }
};
