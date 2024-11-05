import { showToast, Toast, List, ActionPanel, Action } from '@raycast/api';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "https://marko.tech/api/news";

// Define the response and post types
interface Response {
  page: number;
  paged: number;
  pages: number;
  results: Post[];
}

interface Post {
  _id: {
    $oid: string;
  };
  description: string;
  feed: string;
  link: string;
  title: string;
}

// Slugify the title to use as the icon filename
function slugify(str: string): string {
  return str
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading and trailing spaces
    .replace(/\s+/g, '-') // Replace spaces (including multiple spaces) with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

// Fetch the data from the API
async function fetchAPIData(): Promise<Response | null> {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Return the data object directly
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    showToast(Toast.Style.Failure, "Error fetching data", message);
    return null;
  }
}

// Render the list of posts
export default function Command() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchAPIData();
      if (data && data.results) {
        setPosts(data.results);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return <List><List.Item title="🏠 Loading News from startyparty.dev..." /></List>;
  }

  if (posts.length === 0) {
    showToast(Toast.Style.Failure, "No data found.");
    return <List><List.Item title="No results found. Check startyparty.dev for more." /></List>;
  }

  return (
    <List>
      {posts.map((post) => (
        <List.Item
          key={post._id.$oid}
          title={post.title}
          // subtitle={post.description.substring(0, 50) + '...'} // TODO: USE?
          accessories={[{ text: post.feed.toLocaleString() }]}
          icon={{
            source: `https://startyparty.nyc3.cdn.digitaloceanspaces.com/publishers/${slugify(post.feed)}.png`,
            fallback: "icon.png",
            tooltip: post.feed.toLocaleString(),
          }}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Read Article" url={post.link} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
