const Badge = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default:
      "bg-gray-100 text-gray-700",

    success:
      "bg-green-100 text-green-700",

    warning:
      "bg-yellow-100 text-yellow-700",

    danger:
      "bg-red-100 text-red-700",

    info:
      "bg-blue-100 text-blue-700",

    purple:
      "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;