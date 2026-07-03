const CUSTOMER_ID_PREFIX = "FCR-C";
const CUSTOMER_ID_START_NUMBER = 10000;

export function parseCustomerId(customerId) {
  if (!customerId) return null;

  const match = String(customerId).match(/^FCR-C(\d+)$/i);
  if (match) {
    return Number(match[1]);
  }

  const legacyMatch = String(customerId).match(/^RCR-C(\d+)$/i);
  if (legacyMatch) {
    return Number(legacyMatch[1]);
  }

  return null;
}

export function formatCustomerId(number) {
  return `${CUSTOMER_ID_PREFIX}${number}`;
}

export async function getNextCustomerId(prismaClient) {
  const customers = await prismaClient.customer.findMany({
    select: { customerId: true },
  });

  let highestNumber = CUSTOMER_ID_START_NUMBER - 1;

  for (const customer of customers) {
    const parsedNumber = parseCustomerId(customer.customerId);
    if (parsedNumber !== null && parsedNumber > highestNumber) {
      highestNumber = parsedNumber;
    }
  }

  return formatCustomerId(highestNumber + 1);
}
