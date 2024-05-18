/* eslint-disable prettier/prettier */
export const getRandomColor = (existingColors: string[]) => {
  const pastelColors = [
    "#FFD1DC",
    "#FFB6C1",
    "#FFC0CB",
    "#FFA07A",
    "#FF7F50",
    "#FF6347",
    "#FFA07A",
    "#FFDAB9",
    "#FFFACD",
    "#FFE4B5",
    "#F0E68C",
    "#E6E6FA",
    "#D8BFD8",
    "#DDA0DD",
    "#FFDAB9",
    "#F5DEB3",
    "#FAF0E6",
    "#F0F8FF",
    "#FFF5EE",
    "#FAEBD7",
  ];

  let color;
  do {
    color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  } while (existingColors.includes(color));

  return color;
};

export const createProcessFile = (processDescription: string, processName: string) => {
  const blob = new Blob([processDescription], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${processName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
