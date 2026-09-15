export type FieldIconName = "code" | "brand" | "origin" | "weight" | "format" | "units";

type FieldIconProps = {
  name: FieldIconName;
};

export function FieldIcon({ name }: FieldIconProps) {
  const common = "fill-none stroke-current";

  return (
    <svg aria-hidden="true" className="h-12 w-12 text-blue" viewBox="0 0 52 52">
      {name === "code" ? (
        <>
          <path className={common} d="m9 15 13-9h12l9 9v17L30 45 9 27V15Z" strokeWidth="1.6" />
          <circle className={common} cx="28" cy="14" r="2.5" strokeWidth="1.6" />
          <path className={common} d="m20 27 8-8m-4 13 8-8m-3 13 7-7" strokeLinecap="round" strokeWidth="1.6" />
        </>
      ) : null}
      {name === "brand" ? (
        <>
          <path className={common} d="m26 4 5 5 7-1 2 7 6 4-3 7 3 7-6 4-2 7-7-1-5 5-5-5-7 1-2-7-6-4 3-7-3-7 6-4 2-7 7 1 5-5Z" strokeWidth="1.5" />
          <circle className={common} cx="26" cy="26" r="10" strokeWidth="1.5" />
          <path className={common} d="m21 26 3 3 7-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </>
      ) : null}
      {name === "origin" ? (
        <>
          <circle className={common} cx="26" cy="26" r="19" strokeWidth="1.5" />
          <path className={common} d="M7 26h38M26 7c6 6 9 12 9 19s-3 13-9 19c-6-6-9-12-9-19s3-13 9-19Z" strokeWidth="1.5" />
        </>
      ) : null}
      {name === "weight" ? (
        <>
          <path className={common} d="M8 10h36v7H8zM12 17h28l4 29H8l4-29Z" strokeLinejoin="round" strokeWidth="1.5" />
          <circle className={common} cx="26" cy="31" r="9" strokeWidth="1.5" />
          <path className={common} d="m26 31 5-5" strokeLinecap="round" strokeWidth="1.5" />
        </>
      ) : null}
      {name === "format" ? (
        <>
          <path className={common} d="m7 16 19-11 19 11v22L26 49 7 38V16Z" strokeLinejoin="round" strokeWidth="1.5" />
          <path className={common} d="m7 16 19 11 19-11M26 27v22" strokeWidth="1.5" />
        </>
      ) : null}
      {name === "units" ? (
        <>
          <path className={common} d="m18 6 8-5 8 5v10l-8 5-8-5V6Zm-10 18 8-5 8 5v10l-8 5-8-5V24Zm20 0 8-5 8 5v10l-8 5-8-5V24ZM18 38l8-5 8 5v10l-8 5-8-5V38Z" strokeLinejoin="round" strokeWidth="1.4" />
        </>
      ) : null}
    </svg>
  );
}
