import { initials, avatarColor } from "../../utils";

export default function Avatar({ name, photo, size = "md" }) {
  const sizes = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-brand-border`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center font-display font-bold text-white ring-2 ring-brand-border shrink-0`}
    >
      {initials(name)}
    </div>
  );
}
