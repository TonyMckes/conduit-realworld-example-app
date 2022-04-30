function FormFieldset({
  autoFocus,
  children,
  handler,
  minLength,
  name,
  normal,
  placeholder,
  required,
  type,
  value,
}) {
  return (
    <fieldset className="form-group">
      <input
        autoFocus={autoFocus}
        className={`form-control ${normal ? "" : "form-control-lg"}`}
        minLength={minLength}
        name={name}
        onChange={handler}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {children}
    </fieldset>
  );
}

export default FormFieldset;
