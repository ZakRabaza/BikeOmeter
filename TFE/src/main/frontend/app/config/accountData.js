// Utility functions to generate arrays

// Generate days from 01 to 31
export const day = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

// Generate months
export const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generate years from 1900 to 2020
export const year = Array.from({ length: 121 }, (_, i) =>
  (1900 + i).toString()
);

// Gender options
export const gender = ["Male", "Female"];

// Generate height range from 50 to 250 cm
export const height = Array.from({ length: 201 }, (_, i) =>
  (50 + i).toString()
);

// Generate weight range from 50 to 250 kg
export const weight = Array.from({ length: 201 }, (_, i) =>
  (50 + i).toString()
);

// Decimal options for height and weight (if needed)
export const decimal = Array.from({ length: 10 }, (_, i) => i.toString());
