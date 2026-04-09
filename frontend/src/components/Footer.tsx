import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/20 bg-white/50 backdrop-blur-sm dark:border-gray-800/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © 2025. Built with <Heart className="inline h-4 w-4 text-red-500" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
