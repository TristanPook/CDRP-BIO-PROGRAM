function Frame12() {
  return (
    <div className="absolute bg-[#cecece] h-[26px] left-0 rounded-bl-[14px] rounded-tl-[14px] top-0 w-[54px]">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-bl-[14px] rounded-tl-[14px]" />
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[normal] left-[calc(50%-16px)] not-italic text-[12px] text-black text-nowrap top-[calc(50%-8px)] whitespace-pre">1 →１</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute bg-[#939393] h-[26px] left-0 rounded-bl-[14px] rounded-tl-[14px] top-[35px] w-[54px]">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-bl-[14px] rounded-tl-[14px]" />
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[normal] left-[calc(50%-18px)] not-italic text-[12px] text-black text-nowrap top-[calc(50%-8px)] whitespace-pre">{` １→ 1`}</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute bg-white h-[26px] left-[56px] rounded-br-[14px] rounded-tr-[14px] top-0 w-[145px]">
      <div aria-hidden="true" className="absolute border border-[#939393] border-solid inset-0 pointer-events-none rounded-br-[14px] rounded-tr-[14px]" />
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[normal] left-[calc(50%-41.5px)] not-italic text-[12px] text-black text-nowrap top-[calc(50%-7px)] whitespace-pre">1234567890</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute bg-white h-[26px] left-[56px] rounded-br-[14px] rounded-tr-[14px] top-[35px] w-[145px]">
      <div aria-hidden="true" className="absolute border border-[#939393] border-solid inset-0 pointer-events-none rounded-br-[14px] rounded-tr-[14px]" />
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[normal] left-[calc(50%-61.5px)] not-italic text-[12px] text-black text-nowrap top-[calc(50%-7px)] whitespace-pre">１２３４５６７８９０</p>
    </div>
  );
}

export default function Group1() {
  return (
    <div className="relative size-full">
      <Frame12 />
      <Frame14 />
      <Frame13 />
      <Frame15 />
    </div>
  );
}