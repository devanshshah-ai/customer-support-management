const Loader = ({
  size = "medium",
  text = "",
}) => {
  const sizes = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-10 w-10",
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
        aria-label="Loading"
      />

      {text && (
        <span className="text-sm text-gray-500">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;