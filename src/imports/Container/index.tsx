function Button() {
  return <div className="absolute bg-[red] border border-[#d8d8d8] border-solid left-0 rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button1() {
  return <div className="absolute bg-[#f78700] border border-[#d8d8d8] border-solid left-[29.58px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button2() {
  return <div className="absolute bg-[yellow] border border-[#d8d8d8] border-solid left-[59.16px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button3() {
  return <div className="absolute bg-[#0f0] border border-[#d8d8d8] border-solid left-[88.73px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button4() {
  return <div className="absolute bg-[#0ff] border border-[#d8d8d8] border-solid left-[118.31px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button5() {
  return <div className="absolute bg-[blue] border border-[#d8d8d8] border-solid left-[147.89px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button6() {
  return <div className="absolute bg-[#9500ff] border border-[#d8d8d8] border-solid left-[177.47px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button7() {
  return <div className="absolute bg-[#f0f] border border-[#d8d8d8] border-solid left-[207.05px] rounded-[2px] size-[26.266px] top-0" data-name="Button" />;
}

function Button8() {
  return <div className="absolute bg-[#ffbbd4] border border-[#d8d8d8] border-solid left-0 rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button9() {
  return <div className="absolute bg-[#840000] border border-[#d8d8d8] border-solid left-[29.58px] rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button10() {
  return <div className="absolute bg-[#d9b485] border border-[#d8d8d8] border-solid left-[59.16px] rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button11() {
  return <div className="absolute bg-[#9c99ff] border border-[#d8d8d8] border-solid left-[88.73px] rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button12() {
  return <div className="absolute bg-white border border-[#d8d8d8] border-solid left-[118.31px] rounded-[11px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button13() {
  return <div className="absolute bg-[#939393] border border-[#d8d8d8] border-solid left-[147.89px] rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button14() {
  return <div className="absolute bg-[#3d3d3d] border border-[#d8d8d8] border-solid left-[177.47px] rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Button15() {
  return <div className="absolute bg-black border border-[#d8d8d8] border-solid left-[207.05px] rounded-[2px] size-[26.266px] top-[28.86px]" data-name="Button" />;
}

function Container1() {
  return (
    <div className="h-[55.141px] relative shrink-0 w-[228.297px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button />
        <Button1 />
        <Button2 />
        <Button3 />
        <Button4 />
        <Button5 />
        <Button6 />
        <Button7 />
        <Button8 />
        <Button9 />
        <Button10 />
        <Button11 />
        <Button12 />
        <Button13 />
        <Button14 />
        <Button15 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Press_Start_2P:Regular',sans-serif] leading-[19.718px] not-italic relative shrink-0 text-[#0a0a0a] text-[13.145px] text-center whitespace-nowrap">Aa</p>
      </div>
    </div>
  );
}

function Button16() {
  return (
    <div className="content-stretch flex h-[55.844px] items-center justify-center relative rounded-[4px] shrink-0 w-[50px]" data-name="Button">
      <div aria-hidden className="absolute bg-[#f4f6f8] inset-0 pointer-events-none rounded-[4px]" />
      <Text />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Text1() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Silkscreen:Regular',sans-serif] leading-[19.718px] not-italic relative shrink-0 text-[#0a0a0a] text-[13.145px] text-center whitespace-nowrap">AA</p>
      </div>
    </div>
  );
}

function Button17() {
  return (
    <div className="bg-[#f2f2f2] content-stretch flex h-[56px] items-center justify-center relative rounded-[7px] shadow-[-2px_-2px_5px_0px_white,2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0 w-[50px]" data-name="Button">
      <Text1 />
    </div>
  );
}

function Button18() {
  return (
    <div className="bg-[#f2f2f2] h-[26px] relative rounded-bl-[7px] rounded-tl-[7px] shadow-[-2px_-2px_5px_0px_white,2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center px-[9.859px] relative size-full">
        <p className="[word-break:break-word] font-['Noto_Sans_JP:Regular',sans-serif] font-normal leading-[14.788px] relative shrink-0 text-[9.859px] text-black text-center whitespace-nowrap">１→ 1</p>
      </div>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute content-stretch flex flex-col h-[26px] items-start justify-center left-0 overflow-clip px-[9.859px] top-[1.5px] w-[119px]" data-name="Text Input">
      <p className="[word-break:break-word] font-['Noto_Sans_JP:Regular',sans-serif] font-normal leading-[14.788px] relative shrink-0 text-[9.859px] text-black text-center w-full">０</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[26px] relative rounded-br-[11.502px] rounded-tr-[11.502px] shrink-0 w-[119px]" data-name="Container">
      <div aria-hidden className="absolute bg-clip-padding bg-white border-0 border-[transparent] border-solid inset-0 pointer-events-none rounded-br-[11.502px] rounded-tr-[11.502px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <TextInput />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_2px_4px_0px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex h-[26px] items-center relative shrink-0" data-name="Container">
      <Button18 />
      <Container3 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.141px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1406 13.1406">
        <g id="Icon">
          <path d="M8.21288 6.5703H1.64258" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.09505" />
          <path d="M9.30792 9.85545H1.64258" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.09505" />
          <path d="M11.498 3.28515H1.64258" id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.09505" />
        </g>
      </svg>
    </div>
  );
}

function Button19() {
  return (
    <div className="bg-[#f2f2f2] content-stretch flex h-[55.844px] items-center justify-center px-[11.502px] relative rounded-[7px] shadow-[-2px_-2px_5px_0px_white,2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0" data-name="Button">
      <Icon />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9px] items-start relative size-full">
        <Button16 />
        <Button17 />
        <Container2 />
        <Button19 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#f4f6f8] content-stretch flex flex-col gap-[9px] items-start p-[14.78px] relative rounded-tl-[7px] rounded-tr-[7px] shadow-[-5px_-5px_20px_0px_white,5px_5px_20px_0px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <Container1 />
      <Frame />
    </div>
  );
}