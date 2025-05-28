"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

const fetchPicsumImages = async (): Promise<PicsumImage[]> => {
  const response = await fetch("https://picsum.photos/v2/list?limit=30");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const TestImagePage = () => {
  const { data } = useQuery({
    queryKey: ["picsumImages"],
    queryFn: fetchPicsumImages,
  });
  console.log({
    data,
  });

  return (
    <section>
      <h3 className="flex justify-center font-bold text-2xl mt-4">
        테스트 이미지
      </h3>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 p-5">
        {data?.map((image) => (
          <div key={image.id} className="border border-gray-300 rounded-md p-2">
            <div className="relative w-[300px] h-[300px]">
              <Image
                src={`https://picsum.photos/id/${image.id}/300/300`}
                alt={`Photo by ${image.author}`}
                fill
              />
            </div>
            <div className="p-2.5 bg-[#f8f8f8]">
              <p className="text-sm text-gray-500 my-[5px]">
                Author: {image.author}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestImagePage;
