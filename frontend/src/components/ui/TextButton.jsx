function TextButton({
  href,
  onClick,
  label = "View Full Menu",
  className = "",
}) {
  const sharedClasses = `inline-block border-b border-primary pb-1 font-body text-xl leading-normal text-primary transition-colors hover:border-primary-container hover:text-primary-container hover:cursor-pointer ${className}`;

  return (
    <div className="flex justify-center px-5 py-4 md:px-20 ">
      {href ? (
        <a href={href} className={sharedClasses}>
          {label}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={sharedClasses}>
          {label}
        </button>
      )}
    </div>
  );
}

export default TextButton;
