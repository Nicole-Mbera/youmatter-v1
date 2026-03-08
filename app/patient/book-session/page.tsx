'use client';

import { Suspense } from 'react';
import BookSessionContent from './book-session-content';

export default function BookSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookSessionContent />
    </Suspense>
  );
}
