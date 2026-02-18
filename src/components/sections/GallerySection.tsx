'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { weddingConfig } from '../../config/wedding-config';

interface GallerySectionProps {
  bgColor?: 'white' | 'beige';
}

const GallerySection = ({ bgColor = 'white' }: GallerySectionProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/gallery');
        if (!response.ok) {
          throw new Error('failed');
        }
        const data = await response.json();
        const galleryImages = Array.isArray(data.images) ? data.images : [];
        setImages(galleryImages.length > 0 ? galleryImages : weddingConfig.gallery.images);
      } catch {
        setError('이미지를 불러오는데 문제가 발생했습니다.');
        setImages(weddingConfig.gallery.images);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <GallerySectionContainer $bgColor={bgColor}>
      <SectionTitle>갤러리</SectionTitle>

      {isLoading && <Message>이미지를 불러오는 중...</Message>}
      {!isLoading && error && <Message>{error}</Message>}
      {!isLoading && !error && images.length === 0 && <Message>갤러리 이미지가 없습니다.</Message>}

      {!isLoading && images.length > 0 && (
        <GalleryGrid>
          {images.map((image, idx) => (
            <GalleryItem key={`${image}-${idx}`}>
              <GalleryImage
                src={image}
                alt={`웨딩 갤러리 이미지 ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ objectFit: 'cover' }}
              />
            </GalleryItem>
          ))}
        </GalleryGrid>
      )}
    </GallerySectionContainer>
  );
};

const GallerySectionContainer = styled.section<{ $bgColor: 'white' | 'beige' }>`
  padding: 4rem 1.5rem;
  text-align: center;
  background-color: ${props => (props.$bgColor === 'beige' ? '#F8F6F2' : 'white')};
`;

const SectionTitle = styled.h2`
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
  font-weight: 500;
  font-size: 1.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--secondary-color);
  }
`;

const Message = styled.p`
  margin: 0.5rem auto 1rem;
  max-width: 40rem;
  line-height: 1.7;
`;

const GalleryGrid = styled.div`
  max-width: 56rem;
  margin: 1rem auto 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
  }
`;

const GalleryItem = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
`;

const GalleryImage = styled(Image)`
  display: block;
`;

export default GallerySection;
