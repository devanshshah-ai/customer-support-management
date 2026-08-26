const EmptyState = ({
  title = "No data found",
  message = "There is nothing to display here.",
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500">
        ∅
      </div>

      <h3 className="text-base font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {message}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;