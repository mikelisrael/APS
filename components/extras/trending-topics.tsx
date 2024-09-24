import { Ellipsis } from "lucide-react";

type TrendingTopic = {
  category: string;
  hashtag: string;
  count: string;
};

const trendingTopics: TrendingTopic[] = [
  { category: "Frontend developers", hashtag: "#Frontend", count: "30.1k" },
  { category: "Backend technologies", hashtag: "#Backend", count: "25.5k" },
  { category: "Machine Learning", hashtag: "#ML", count: "40.2k" },
  { category: "Data Science", hashtag: "#DataScience", count: "35.7k" },
  { category: "DevOps practices", hashtag: "#DevOps", count: "22.3k" },
];

const TrendingTopics = () => {
  return (
    <ul>
      {trendingTopics.map((topic, index) => (
        <li
          key={index}
          className="flex-center cursor-pointer justify-between gap-4 rounded-md p-2 hover:bg-muted"
        >
          <div>
            <span className="line-clamp-1 text-sm text-muted-foreground">
              {topic.category}
            </span>
            <h4 className="font-semibold">{topic.hashtag}</h4>
            <span className="line-clamp-1 text-sm text-muted-foreground">
              {topic.count}
            </span>
          </div>

          <Ellipsis className="size-5 text-muted-foreground" />
        </li>
      ))}
    </ul>
  );
};

export default TrendingTopics;
