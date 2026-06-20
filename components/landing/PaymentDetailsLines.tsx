import {
  PAYMENT_FIELD_META,
  type PaymentDetails,
  type PaymentDetailKey,
} from "@/lib/payment-settings-shared";

const DISPLAY_ORDER: PaymentDetailKey[] = [
  "banco",
  "alias",
  "cbu",
  "cvu",
  "cuenta",
];

export function PaymentDetailsLines({ details }: { details: PaymentDetails }) {
  const filled = DISPLAY_ORDER.filter((key) => details[key]?.trim());

  if (filled.length === 0) return null;

  return (
    <>
      {filled.map((key) => (
        <span key={key} className="block">
          {PAYMENT_FIELD_META[key].label}:{" "}
          <span className="font-semibold break-all text-navy">{details[key].trim()}</span>
        </span>
      ))}
    </>
  );
}
