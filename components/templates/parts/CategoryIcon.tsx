type CategoryIconProps = {
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
};

export function CategoryIcon({ category }: CategoryIconProps) {
  if (category === "Cerdo") {
    return (
      <svg aria-hidden="true" className="h-11 w-14" viewBox="0 0 64 48">
        <path d="M10 18c3-8 13-11 25-9 7 1 12 5 15 10l7-2-1 8-6 2c-2 7-8 11-18 11H18C9 36 5 30 6 23l4-5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M17 37v5m25-5v5M13 17 9 12m39 7c-2 0-3 1-3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (category === "Pollo") {
    return (
      <svg aria-hidden="true" className="h-11 w-14" viewBox="0 0 64 48">
        <path d="M20 10c2 8 8 11 15 8 6-3 8-8 7-14 4 1 7 4 7 8l5 1-5 4c-1 13-8 21-20 22-9 0-15-6-15-15 0-6 2-11 6-14Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M27 39v5m9-6 3 5M46 8l3-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (category === "Vacuno") {
    return (
      <svg aria-hidden="true" className="h-11 w-14" viewBox="0 0 64 48">
        <path d="M10 14h37l8 7-5 14H20l-5-7H8l2-14Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M18 35v8m27-8v8M49 15l4-7m-7 5-5-6M15 27h7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-11 w-14" viewBox="0 0 64 48">
      <path d="m14 37 8-3L49 7l3-5 1 6-26 30-3 8-4-6-6-3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
