import * as utils from './utils';
import {
  SmartTransactionMinedTx,
  APIType,
  SmartTransactionStatuses,
  SmartTransactionCancellationReason,
} from './types';
import { API_BASE_URL, CHAIN_IDS, CHAIN_IDS_HEX_TO_DEC } from './constants';

describe('src/utils.js', () => {
  describe('isSmartTransactionPending', () => {
    const createSmartTransaction = () => {
      return {
        uuid: 'sdfasfj345345dfgag45353',
        status: 'pending',
        statusMetadata: {
          error: undefined,
          minedTx: SmartTransactionMinedTx.NOT_MINED,
          cancellationFeeWei: 10000,
          deadlineRatio: 10,
          minedHash: undefined,
        },
      };
    };

    it('returns true is a smart transaction is not yet mined and there is no error', () => {
      const smartTransaction = createSmartTransaction();
      expect(utils.isSmartTransactionPending(smartTransaction)).toBe(true);
    });
  });

  describe('getAPIRequestURL', () => {
    const ethereumChainIdDec = CHAIN_IDS_HEX_TO_DEC[CHAIN_IDS.ETHEREUM];

    it('returns a URL for getting transactions', () => {
      expect(
        utils.getAPIRequestURL(APIType.GET_TRANSACTIONS, CHAIN_IDS.ETHEREUM),
      ).toBe(`${API_BASE_URL}/networks/${ethereumChainIdDec}/getTransactions`);
    });

    it('returns a URL for submitting transactions', () => {
      expect(
        utils.getAPIRequestURL(APIType.SUBMIT_TRANSACTIONS, CHAIN_IDS.ETHEREUM),
      ).toBe(
        `${API_BASE_URL}/networks/${ethereumChainIdDec}/submitTransactions`,
      );
    });

    it('returns a URL for transaction cancelation', () => {
      expect(utils.getAPIRequestURL(APIType.CANCEL, CHAIN_IDS.ETHEREUM)).toBe(
        `${API_BASE_URL}/networks/${ethereumChainIdDec}/cancel`,
      );
    });

    it('returns a URL for checking a smart transactions status', () => {
      expect(
        utils.getAPIRequestURL(APIType.BATCH_STATUS, CHAIN_IDS.ETHEREUM),
      ).toBe(`${API_BASE_URL}/networks/${ethereumChainIdDec}/batchStatus`);
    });

    it('returns a URL for smart transactions API liveness', () => {
      expect(utils.getAPIRequestURL(APIType.LIVENESS, CHAIN_IDS.ETHEREUM)).toBe(
        `${API_BASE_URL}/networks/${ethereumChainIdDec}/health`,
      );
    });

    it('returns a URL for smart transactions API liveness for the BSC chainId', () => {
      const bscChainIdDec = CHAIN_IDS_HEX_TO_DEC[CHAIN_IDS.BSC];
      expect(utils.getAPIRequestURL(APIType.LIVENESS, CHAIN_IDS.BSC)).toBe(
        `${API_BASE_URL}/networks/${bscChainIdDec}/health`,
      );
    });
  });

  describe('isSmartTransactionStatusResolved', () => {
    it('returns true if status response is "uuid_not_found"', () => {
      const statusResponse = 'uuid_not_found';
      expect(utils.isSmartTransactionStatusResolved(statusResponse)).toBe(true);
    });

    it('returns false if status response is not', () => {
      const statusResponse = {
        minedTx: SmartTransactionMinedTx.NOT_MINED,
        cancellationReason: SmartTransactionCancellationReason.NOT_CANCELLED,
        minedHash: '',
        cancellationFeeWei: 0.1,
        deadlineRatio: 0.1,
      };
      expect(utils.isSmartTransactionStatusResolved(statusResponse)).toBe(
        false,
      );
    });
  });

  describe('calculateStatus', () => {
    const createStatusResponse = () => ({
      minedTx: SmartTransactionMinedTx.NOT_MINED,
      cancellationReason: SmartTransactionCancellationReason.NOT_CANCELLED,
      minedHash: '',
      cancellationFeeWei: 0.1,
      deadlineRatio: 0.1,
    });

    it('returns pending if transaction is not mined and has no cancellationReason', () => {
      const statusResponse = createStatusResponse();
      expect(utils.calculateStatus(statusResponse)).toStrictEqual(
        SmartTransactionStatuses.PENDING,
      );
    });

    it('returns success if minedTx is success', () => {
      const statusResponse = {
        ...createStatusResponse(),
        minedTx: SmartTransactionMinedTx.SUCCESS,
      };
      expect(utils.calculateStatus(statusResponse)).toStrictEqual(
        SmartTransactionStatuses.SUCCESS,
      );
    });

    it('returns reverted if minedTx is reverted', () => {
      const statusResponse = {
        ...createStatusResponse(),
        minedTx: SmartTransactionMinedTx.REVERTED,
      };
      expect(utils.calculateStatus(statusResponse)).toStrictEqual(
        SmartTransactionStatuses.REVERTED,
      );
    });

    it('returns unknown if minedTx is unknown', () => {
      const statusResponse = {
        ...createStatusResponse(),
        minedTx: SmartTransactionMinedTx.UNKNOWN,
      };
      expect(utils.calculateStatus(statusResponse)).toStrictEqual(
        SmartTransactionStatuses.UNKNOWN,
      );
    });

    it('returns cancellation state if cancellationReason provided', () => {
      const statusResponse = {
        ...createStatusResponse(),
        cancellationReason: SmartTransactionCancellationReason.USER_CANCELLED,
      };
      expect(utils.calculateStatus(statusResponse)).toStrictEqual(
        SmartTransactionStatuses.CANCELLED_USER_CANCELLED,
      );
    });
  });
});
