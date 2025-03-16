import {
  createCampaign,
  dashboard,
  logout,
  payment,
  profile,
  withdraw,
  categories,
  home,
} from "../assets";

export const navlinks = [
  {
    name: "Home",
    imgUrl: home,
    link: "/",
  },
  {
    name: "campaign",
    imgUrl: createCampaign,
    link: "/create-campaign",
  },
  {
    name: "categories",
    imgUrl: categories,
    link: "/categories",
  },
  {
    name: "profile",
    imgUrl: profile,
    link: "/profile",
  },
];
