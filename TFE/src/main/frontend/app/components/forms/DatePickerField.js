import React from "react";
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import ErrorMessage from "./ErrorMessage";

function DatePickerField({ name, ...otherProps }) {
  const { setFieldValue, setFieldTouched, handleChange, errors, touched } =
    useFormikContext();
  const [field] = useField(otherProps);

  return (
    <>
      <DatePicker
        {...field}
        {...otherProps}
        selected={(field.value && new Date(field.value)) || null}
        onChange={(val) => {
          setFieldValue(field.name, val);
        }}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

export default DatePickerField;
