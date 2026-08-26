const ErrorMessage = ({
  message = "Something went wrong.",
  onRetry,
}) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-800">
            Something went wrong
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;