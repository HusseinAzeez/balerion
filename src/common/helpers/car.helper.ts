import { CmuCertifiedRequestStatus } from '../enums/cmu-certified-request.enum';

export function calculateMonthlyInstallment(
  price: number,
  discount: number,
  downPayment: number,
  loanTerm: number,
  interestRate: number,
) {
  const processFee = 0;
  const loanTermInYears = loanTerm / 12;

  const priceWithVAT = price + price * 0.07;

  let financeAmount = priceWithVAT + processFee - downPayment;

  if (discount > 0) {
    financeAmount -= discount;
  }

  const interestAmount = financeAmount * (interestRate / 100) * loanTermInYears;

  return Math.abs(Math.round((financeAmount + interestAmount) / loanTerm));
}

export function mapCmuCertifiedStatus(status: CmuCertifiedRequestStatus) {
  switch (status) {
    case CmuCertifiedRequestStatus.APPROVED:
      return 'Yes';
    case CmuCertifiedRequestStatus.ON_HOLD:
      return 'Hold';
    case CmuCertifiedRequestStatus.WAITING_APPROVAL:
      return 'No';
    default:
      return 'No';
  }
}
