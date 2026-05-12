import { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

export default function InputField({ placeholder, ...props }: InputFieldProps) {
  return (
    <input
      {...props}
      placeholder={placeholder}
      className="w-full rounded-2xl border-none bg-[#f5f6f8] px-6 py-4 text-sm text-gray-700 placeholder-gray-400
        outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#00b4d8]"
    />
  );
}
