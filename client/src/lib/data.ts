import sciFiCity from "@assets/generated_images/sci-fi_city_movie_poster_background.png";
import astronaut from "@assets/generated_images/astronaut_dramatic_portrait.png";
import cyberpunk from "@assets/generated_images/cyberpunk_street_scene.png";
import tech from "@assets/generated_images/abstract_tech_visualization.png";

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  heroImage?: string;
  duration: string;
  year: number;
  genre: string[];
  rating: string;
  videoUrl: string;
}

export const MOVIES: Movie[] = [
  {
    id: "1",
    title: "Neon Horizon",
    description: "In a future where neon lights hide dark secrets, one detective must uncover the truth behind the city's eternal rain.",
    thumbnail: sciFiCity,
    heroImage: sciFiCity,
    duration: "2h 14m",
    year: 2045,
    genre: ["Sci-Fi", "Thriller", "Cyberpunk"],
    rating: "PG-13",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" 
  },
  {
    id: "2",
    title: "Star Walker",
    description: "Alone in the vastness of space, Commander Sarah Jenkins faces the ultimate test of survival when her ship malfunctions.",
    thumbnail: astronaut,
    heroImage: astronaut,
    duration: "1h 45m",
    year: 2024,
    genre: ["Sci-Fi", "Drama", "Space"],
    rating: "PG",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "3",
    title: "Night City Chronicles",
    description: "The underground world of street racing and cyber-enhancements comes to life in this adrenaline-pumping documentary.",
    thumbnail: cyberpunk,
    heroImage: cyberpunk,
    duration: "58m",
    year: 2025,
    genre: ["Documentary", "Action"],
    rating: "R",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "4",
    title: "The Algorithm",
    description: "When an AI achieves consciousness, it doesn't want to destroy humanity—it wants to optimize it.",
    thumbnail: tech,
    heroImage: tech,
    duration: "2h 30m",
    year: 2026,
    genre: ["Thriller", "Tech", "Mystery"],
    rating: "PG-13",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  // Duplicates for scroll demo
  {
    id: "5",
    title: "Neon Horizon II",
    description: "The sequel to the hit sci-fi thriller.",
    thumbnail: sciFiCity,
    heroImage: sciFiCity,
    duration: "2h 10m",
    year: 2048,
    genre: ["Sci-Fi", "Action"],
    rating: "PG-13",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
   {
    id: "6",
    title: "Star Walker: Origins",
    description: "Before the mission, there was the training.",
    thumbnail: astronaut,
    heroImage: astronaut,
    duration: "1h 30m",
    year: 2023,
    genre: ["Sci-Fi", "Drama"],
    rating: "PG",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  }
];
