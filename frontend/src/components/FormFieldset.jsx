function FormFieldset({
  children,
  type,
  className,
  placeholder,
  name,
  value,
  onChange,
}) {
  return (
    <fieldset className="form-group">
      <input
        type={type}
        className={`form-control ${className ? className : ""}`}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
      />
      {children}
    </fieldset>
  );
}

export default FormFieldset;
