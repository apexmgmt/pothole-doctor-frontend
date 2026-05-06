/**
 * Format a number as a currency string with specified decimal points, symbol, and symbol position.
 * @param amount number
 * @param decimalPoint number default = 2
 * @param symbol string default = '$'
 * @param symbolPosition 'pre' | 'post' default = 'pre'
 * @returns string formatted currency string
 */
export const formatCurrency = (
  amount: number,
  decimalPoint: number = 2,
  symbol: string = '$',
  symbolPosition: 'pre' | 'post' = 'pre'
) => {
  const amountNumber = Number(amount)

  if (isNaN(amountNumber)) {
    return `${symbolPosition === 'pre' ? symbol : ''}0${symbolPosition === 'post' ? symbol : ''}`
  }

  if (amountNumber === 0) {
    return `${symbolPosition === 'pre' ? symbol : ''}0${symbolPosition === 'post' ? symbol : ''}`
  }

  const formattedAmount = amountNumber.toFixed(decimalPoint)

  return `${symbolPosition === 'pre' ? symbol : ''}${formattedAmount}${symbolPosition === 'post' ? symbol : ''}`
}
