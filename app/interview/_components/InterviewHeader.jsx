import Image from "next/image";

function InterviewHeader() {
  return (
    <div className="p-4 shadow-sm">
      <Image
        src={"/logo.jpeg"}
        alt="logo"
        width={100}
        height={100}
        className="w-35"
      />
    </div>
  );
}

export default InterviewHeader;
