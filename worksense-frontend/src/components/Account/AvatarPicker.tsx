import React, { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const BASE = "https://anonymous-animals.azurewebsites.net/animal/";
const SEEDS = [
  "alligator",
  "chipmunk",
  "gopher",
  "liger",
  "quagga",
  "anteater",
  "chupacabra",
  "grizzly",
  "llama",
  "rabbit",
  "armadillo",
  "cormorant",
  "hedgehog",
  "manatee",
  "raccoon",
  "auroch",
  "coyote",
  "hippo",
  "mink",
  "rhino",
  "axolotl",
  "crow",
  "hyena",
  "monkey",
  "sheep",
  "badger",
  "dingo",
  "ibex",
  "moose",
  "shrew",
  "bat",
  "dinosaur",
  "ifrit",
  "narwhal",
  "skunk",
  "beaver",
  "dolphin",
  "iguana",
  "orangutan",
  "squirrel",
  "buffalo",
  "duck",
  "jackal",
  "otter",
  "tiger",
  "camel",
  "elephant",
  "kangaroo",
  "panda",
  "turtle",
  "capybara",
  "ferret",
  "koala",
  "penguin",
  "walrus",
  "chameleon",
  "fox",
  "kraken",
  "platypus",
  "wolf",
  "cheetah",
  "frog",
  "lemur",
  "pumpkin",
  "wolverine",
  "chinchilla",
  "giraffe",
  "leopard",
  "python",
  "wombat",
];

interface Props {
  onSelect: (url: string) => void;
}

export const AvatarPicker: React.FC<Props> = ({ onSelect }) => {
  const [search, setSearch] = useState("");
  const list = SEEDS.filter((a) => a.includes(search.toLowerCase()));
  return (
    <div className="border rounded-lg p-4 bg-card">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search animals…"
        className="w-full px-3 py-2 mb-4 rounded-md border"
      />
      <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto place-items-center">
        {list.map((animal) => {
          const url = `${BASE}${animal}`;
          return (
            <button
              key={animal}
              onClick={() => onSelect(url)}
              className="focus:outline-none transition-transform duration-200 hover:scale-105 rounded-full flex items-center justify-center"
            >
              <Avatar className="size-12">
                <AvatarImage
                  src={url}
                  alt={animal}
                  loading="lazy"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </Avatar>
            </button>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="text-center text-sm mt-2">No animals found</p>
      )}
    </div>
  );
};
