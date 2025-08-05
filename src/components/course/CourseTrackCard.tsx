import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Clock, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseTrackCard = ({ track }: { track: any }) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <Card
      className="group overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-transparent bg-white dark:bg-gray-800/50"
      onClick={() => navigate(`/track/${track.id}`)}
    >
      <div className="aspect-video relative">
        <img
          src={track.thumbnailUrl || `https://source.unsplash.com/random/400x225?${track.title.split(' ')[0]}`}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-lg text-white line-clamp-2">{track.title}</h3>
        </div>
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Badge variant="outline" className="capitalize">{track.level}</Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">{track.description}</p>
        
        <Separator className="my-3" />

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1"><Users className="h-4 w-4"/>{track.enrollmentCount || 0}</div>
          <div className="flex items-center gap-1"><Clock className="h-4 w-4"/>{track.duration}h</div>
          <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400"/>{track.rating || 'New'}</div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(track.price || 0)}</p>
          <Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600 text-white">
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTrackCard;