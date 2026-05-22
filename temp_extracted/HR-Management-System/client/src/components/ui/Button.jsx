export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "h-10 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition";

  const styles = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300"
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}