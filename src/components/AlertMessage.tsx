interface AlertMessageProps {
  message: string;
}

export default function AlertMessage({ message }: AlertMessageProps) {
  return <div className="alert-danger">{message}</div>;
}