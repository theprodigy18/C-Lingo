import { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

export default function InputField({ placeholder, ...props }: InputFieldProps) {
  return (
    <input
      {...props}
      placeholder={placeholder}
      className="w-full rounded-full bg-slate-100 px-5 py-3.5 text-sm text-slate-700 placeholder-slate-400
        outline-none border border-transparent
        focus:border-[#00c8f0] focus:bg-white focus:ring-2 focus:ring-[#00c8f0]/20
        transition-all duration-200"
    />
  );
}
