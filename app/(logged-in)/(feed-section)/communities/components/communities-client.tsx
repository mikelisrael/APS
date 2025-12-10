"use client";

import ImageLoader from "@/components/shared/image-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { MessageSquare, Search, UsersRound } from "lucide-react";

const communities = [
  {
    id: 1,
    name: "React.js Developers",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzZsmpHvJVwm9bEAj-SfiRHFcgXRnFyzwpwQ&s",
    members: "1.2k",
    posts: 876,
    description:
      "A community for React.js developers to share knowledge, ask questions, and collaborate on projects."
  },
  {
    id: 2,
    name: "Python Programming",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/172px-Python-logo-notext.svg.png",
    members: "2.5k",
    posts: 1543,
    description:
      "Learn Python programming from basics to advanced. Share your projects and get help with coding challenges."
  },
  {
    id: 3,
    name: "Machine Learning & AI",
    image: "https://cdn-icons-png.flaticon.com/512/8637/8637099.png",
    members: "1.8k",
    posts: 1021,
    description:
      "Explore machine learning algorithms, neural networks, and artificial intelligence applications."
  },
  {
    id: 4,
    name: "Web Development",
    image: "https://cdn-icons-png.flaticon.com/512/1055/1055646.png",
    members: "3.1k",
    posts: 2187,
    description:
      "Full-stack web development community covering HTML, CSS, JavaScript, and modern frameworks."
  },
  {
    id: 5,
    name: "Cybersecurity",
    image: "https://cdn-icons-png.flaticon.com/512/6195/6195699.png",
    members: "956",
    posts: 624,
    description:
      "Discuss security best practices, ethical hacking, penetration testing, and network security."
  },
  {
    id: 6,
    name: "Mobile App Development",
    image: "https://cdn-icons-png.flaticon.com/512/2721/2721633.png",
    members: "1.4k",
    posts: 891,
    description:
      "Build mobile applications for iOS and Android using React Native, Flutter, and native development."
  },
  {
    id: 7,
    name: "Data Science",
    image: "https://cdn-icons-png.flaticon.com/512/2920/2920349.png",
    members: "2.2k",
    posts: 1456,
    description:
      "Analyze data, create visualizations, and build predictive models using Python, R, and SQL."
  },
  {
    id: 8,
    name: "DevOps & Cloud",
    image: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
    members: "1.1k",
    posts: 743,
    description:
      "Learn about CI/CD, Docker, Kubernetes, AWS, Azure, and cloud infrastructure management."
  },
  {
    id: 9,
    name: "Game Development",
    image: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
    members: "1.6k",
    posts: 982,
    description:
      "Create games using Unity, Unreal Engine, and other game development tools and frameworks."
  },
  {
    id: 10,
    name: "Database Design",
    image: "https://cdn-icons-png.flaticon.com/512/2906/2906274.png",
    members: "876",
    posts: 531,
    description:
      "Master SQL, NoSQL databases, database optimization, and data modeling techniques."
  },
  {
    id: 11,
    name: "UI/UX Design",
    image: "https://cdn-icons-png.flaticon.com/512/3588/3588592.png",
    members: "1.9k",
    posts: 1276,
    description:
      "Design beautiful and intuitive user interfaces using Figma, Adobe XD, and design principles."
  },
  {
    id: 12,
    name: "Blockchain & Web3",
    image: "https://cdn-icons-png.flaticon.com/512/7119/7119757.png",
    members: "723",
    posts: 412,
    description:
      "Explore blockchain technology, smart contracts, cryptocurrency, and decentralized applications."
  }
];

const CommunitiesClient = () => {
  return (
    <main className="~px-2/5">
      <section className="flex-between mb-6">
        <h1 className="page-title !px-0">Communities</h1>
        <Button>Create Community</Button>
      </section>

      <section className="sticky top-0 z-10 flex items-stretch gap-4 bg-background pb-7 pt-4 dark:bg-[#121212]">
        <div className="flex flex-grow items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search for communities"
            className="grow bg-card text-sm focus:outline-none"
          />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {communities.map((community) => (
          <Card key={community.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ImageLoader
                  src={community.image}
                  alt={`${community.name} Cover Photo`}
                  className="aspect-square w-10 rounded-md bg-muted object-cover"
                  showLoader={false}
                />

                <h2 className="text-base font-medium">{community.name}</h2>
              </div>
              <div className="!mt-5 grid grid-cols-2 text-muted-foreground">
                <div className="flex items-center gap-2 text-xs">
                  <UsersRound size={20} /> {community.members} Members
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MessageSquare size={20} /> {community.posts} Posts
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {community.description}
              </p>
            </CardContent>

            <CardFooter>
              <Button className="w-full">Join</Button>
              <Button variant="link" className="w-full">
                View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
};

export default CommunitiesClient;
