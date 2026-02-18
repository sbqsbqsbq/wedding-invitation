import { weddingConfig } from "./wedding-config";

export const weddingConfigEn = {
  meta: {
    title: "You are Invited to Daeyeong Kim & Jeen Lee Wedding",
    description: "Wedding Invitation",
    ogImage: weddingConfig.meta.ogImage,
  },
  main: {
    title: "Wedding Invitation",
    image: weddingConfig.main.image,
    date: "Saturday, May 23, 2026 at 11:30 AM",
    venue: "Gonzaga Convention, Sogang University",
  },
  invitation: {
    message:
      "A precious journey that began with two hearts\nis now becoming one path.\n\nWith love and trust,\nwe are beginning a new chapter together.\n\nYour presence and blessing\nwould mean the world to us.",
    couple: {
      groom: "Daeyeong Kim",
      bride: "Jeen Lee",
    },
  },
  date: {
    year: weddingConfig.date.year,
    month: weddingConfig.date.month,
    day: weddingConfig.date.day,
    hour: weddingConfig.date.hour,
    minute: weddingConfig.date.minute,
    timezone: "Asia/Seoul",
  },
  venue: {
    name: "Gonzaga Convention, Sogang University",
    address:
      "35 Baekbeom-ro, Mapo-gu, Seoul\nInside the rear gate of Sogang University",
    tel: weddingConfig.venue.tel,
    mapZoom: weddingConfig.venue.mapZoom,
    coordinates: {
      latitude: weddingConfig.venue.coordinates.latitude,
      longitude: weddingConfig.venue.coordinates.longitude,
    },
    placeId: weddingConfig.venue.placeId,
    transportation: {
      subway:
        "Line 6: 5-minute walk from Exit 1, Daeheung Station\nLine 2: 15-minute walk from Exit 6, Ewha Womans Univ. Station",
      bus: "Blue: 153, 163\nGreen: 5712, 5714, 6712\n(Get off at Sogang University Rear Gate)",
    },
    parking: "Underground parking available (free for 2 hours)",
  },
  rsvp: {
    showMealOption: weddingConfig.rsvp?.showMealOption ?? true,
  },
};

export type WeddingConfigEn = typeof weddingConfigEn;
