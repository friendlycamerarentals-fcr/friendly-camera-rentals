export const REWARD_STATUS = {
  ACTIVE: "Active",
  APPLIED: "Applied",
  USED: "Used",
  EXPIRED: "Expired",
};

export const REWARD_PERCENTAGE = 10;

export const REWARD_VALIDITY_MONTHS = 3;

export const REWARD_ID_PREFIX = "FCR-R";

export const REWARD_START_NUMBER = 100001;

export const REWARD_STATUS_OPTIONS = [
  REWARD_STATUS.ACTIVE,
  REWARD_STATUS.APPLIED,
  REWARD_STATUS.USED,
  REWARD_STATUS.EXPIRED,
];

export const isRewardActive = (reward) =>
  reward?.status === REWARD_STATUS.ACTIVE;

export const isRewardExpired = (reward) =>
  reward?.status === REWARD_STATUS.EXPIRED;

export const isRewardUsed = (reward) => reward?.status === REWARD_STATUS.USED;

export const isRewardApplied = (reward) =>
  reward?.status === REWARD_STATUS.APPLIED;
