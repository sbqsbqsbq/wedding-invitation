const uniqueIdentifier = "JWK-WEDDING-TEMPLATE-V1";

// 갤러리 레이아웃 타입 정의
type GalleryLayout = "scroll" | "grid";
type GalleryPosition = "middle" | "bottom";

interface GalleryConfig {
  layout: GalleryLayout;
  position: GalleryPosition;
  images: string[];
}

export const weddingConfig = {
  // 메타 정보
  meta: {
    title: "김대영 ❤️ 이지인의 결혼식에 초대합니다",
    description: "결혼식 초대장",
    ogImage: "/images/main.jpeg",
    noIndex: true,
    _jwk_watermark_id: uniqueIdentifier,
  },

  // 메인 화면
  main: {
    title: "Wedding Invitation",
    image: "/images/main.jpeg",
    date: "2026년 5월 23일 토요일 11시 30분",
    venue: "서강대학교 곤자가컨벤션",
  },

  // 소개글
  intro: {
    title: "",
    text: "서로를 바라보며 걸어온\n소중한 발걸음이\n이제 하나의 길로 이어집니다.\n\n사랑과 믿음으로\n새 가정을 이루는 저희 두 사람의\n작은 시작을 알려드립니다.",
  },

  // 결혼식 일정
  date: {
    year: 2026,
    month: 5,
    day: 23,
    hour: 11,
    minute: 30,
    displayDate: "2026.05.23 SAT PM 11:30",
  },

  // 장소 정보
  venue: {
    name: "서강대학교 곤자가컨벤션",
    address: "서울시 마포구 백범로 35(대흥동)\n서강대학교 후문 내 곤자가컨벤션",
    tel: "02-1234-5678",
    naverMapId: "곤자가컨벤션", // 네이버 지도 검색용 장소명
    coordinates: {
      latitude: 37.5665,
      longitude: 126.978,
    },
    placeId: "123456789", // 네이버 지도 장소 ID
    mapZoom: "17", // 지도 줌 레벨
    mapNaverCoordinates: "14141300,4507203,15,0,0,0,dh", // 네이버 지도 길찾기 URL용 좌표 파라미터 (구 형식)
    transportation: {
      subway:
        "6호선 대흥역 1번 출구에서 우회전 도보 5분\n2호선 이대역 6번출구 좌회전 도보 15분",
      bus: "간선\n 153, 163\n지선\n 5712, 5714, 6712 (서강대학교 후문앞 하차)",
    },
    parking: "건물 지하 주차장 이용 가능 (2시간 무료)",
    // 신랑측 배차 안내
    groomShuttle: {
      location: "신천역 5번 출구",
      departureTime: "오전 10시 출발",
      contact: {
        name: "길벗관광",
        tel: "010-6331-5665",
      },
    },
    // 신부측 배차 안내
    // brideShuttle: {
    //   location: "신부측 배차 출발지",
    //   departureTime: "오전 11시 출발",
    //   contact: {
    //     name: "담당자명",
    //     tel: "010-9876-5432",
    //   },
    // },
  },

  // 갤러리
  gallery: {
    layout: "grid" as GalleryLayout, // "scroll" 또는 "grid" 선택
    position: "bottom" as GalleryPosition, // "middle" (현재 위치) 또는 "bottom" (맨 하단) 선택
    images: [
      "/images/gallery/image1.jpg",
      "/images/gallery/image2.jpg",
      "/images/gallery/image3.jpg",
      "/images/gallery/image4.jpg",
      "/images/gallery/image5.jpg",
      "/images/gallery/image6.jpg",
      "/images/gallery/image7.jpg",
      "/images/gallery/image8.jpg",
      "/images/gallery/image9.jpg",
    ],
  } as GalleryConfig,

  // 초대의 말씀
  invitation: {
    message:
      "한 줄기 별빛이 되어 만난 인연\n평생을 함께 걸어가려 합니다.\n\n소중한 분들의 축복 속에\n저희 두 사람이 첫 걸음을 내딛습니다.\n\n귀한 시간 내어 함께해 주신다면\n그 어떤 축복보다 값진 선물이 될 것입니다.",
    groom: {
      name: "김대영",
      label: "아들",
      father: "김동수",
      mother: "인경애",
    },
    bride: {
      name: "이지인",
      label: "딸",
      father: "이태윤",
      mother: "배정미",
    },
  },

  // 계좌번호
  account: {
    groom: {
      bank: "토스뱅크",
      number: "1000-1477-4874",
      holder: "김대영",
    },
    bride: {
      bank: "토스뱅크",
      number: "1000-3147-5375",
      holder: "이지인",
    },
    groomFather: {
      bank: "신한은행",
      number: "110-525-775715",
      holder: "김동수",
    },
    groomMother: {
      bank: "우리은행",
      number: "1002-180-063213",
      holder: "인경애",
    },
    brideFather: {
      bank: "은행명",
      number: "999-000-111222",
      holder: "이태윤",
    },
    brideMother: {
      bank: "은행명",
      number: "333-444-555666",
      holder: "배정미",
    },
  },

  // RSVP 설정
  rsvp: {
    enabled: false, // RSVP 섹션 표시 여부
    showMealOption: false, // 식사 여부 입력 옵션 표시 여부
  },

  // 슬랙 알림 설정
  slack: {
    webhookUrl: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || "",
    channel: "#wedding-response",
    compactMessage: true, // 슬랙 메시지를 간결하게 표시
  },
};
