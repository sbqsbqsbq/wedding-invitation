'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import LanguageSwitcher from '../../src/components/LanguageSwitcher';
import { weddingConfigEn } from '../../src/config/wedding-config.en';

type Side = 'BRIDE' | 'GROOM' | '';

const eventDate = new Date(
  weddingConfigEn.date.year,
  weddingConfigEn.date.month - 1,
  weddingConfigEn.date.day,
  weddingConfigEn.date.hour,
  weddingConfigEn.date.minute,
);

const HomeEn = () => {
  const [formData, setFormData] = useState({
    name: '',
    side: '' as Side,
    isAttending: null as boolean | null,
    guestCount: 1,
    hasMeal: null as boolean | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const countdownText = useMemo(() => {
    const diff = eventDate.getTime() - Date.now();
    if (diff <= 0) {
      return 'The wedding day has arrived.';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days left until our wedding`;
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsGalleryLoading(true);
        const response = await fetch('/api/gallery');
        if (!response.ok) {
          throw new Error('Failed to fetch gallery');
        }
        const data = await response.json();
        const images = Array.isArray(data.images) ? data.images : [];
        setGalleryImages(images);
      } catch {
        setGalleryError('Unable to load gallery images.');
      } finally {
        setIsGalleryLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (!expandedImage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedImage(null);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedImage]);

  const navigateToNaver = () => {
    const url = `https://map.naver.com/p/directions/-/-/-/walk/place/${weddingConfigEn.venue.placeId}?c=${weddingConfigEn.venue.mapZoom},0,0,0,dh`;
    window.open(url, '_blank');
  };

  const navigateToKakao = () => {
    const { latitude, longitude } = weddingConfigEn.venue.coordinates;
    const name = encodeURIComponent(weddingConfigEn.venue.name);
    window.open(`https://map.kakao.com/link/to/${name},${latitude},${longitude}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.side || formData.isAttending === null) {
      setSubmitMessage({
        success: false,
        message: 'Please fill in your name, side, and attendance.',
      });
      return;
    }

    if (weddingConfigEn.rsvp.showMealOption && formData.isAttending && formData.hasMeal === null) {
      setSubmitMessage({
        success: false,
        message: 'Please select your meal preference.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          side: formData.side === 'BRIDE' ? '신부측' : '신랑측',
          isAttending: formData.isAttending,
          guestCount: formData.isAttending ? formData.guestCount : 0,
          hasMeal: formData.isAttending ? formData.hasMeal : false,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setSubmitMessage({
        success: true,
        message: 'Your RSVP has been submitted. Thank you.',
      });
      setFormData({
        name: '',
        side: '',
        isAttending: null,
        guestCount: 1,
        hasMeal: null,
      });
    } catch {
      setSubmitMessage({
        success: false,
        message: 'Failed to submit RSVP. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Main>
      <LanguageSwitcher current="en" />

      <Hero>
        <HeroImage
          src={weddingConfigEn.main.image}
          alt="Wedding background"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 10%' }}
        />
        <Overlay />
        <HeroContent>
          <HeroTitle>{weddingConfigEn.main.title}</HeroTitle>
          <HeroText>{weddingConfigEn.main.date}</HeroText>
          <HeroText>{weddingConfigEn.main.venue}</HeroText>
        </HeroContent>
      </Hero>

      <Section>
        <SectionTitle>Invitation</SectionTitle>
        <Message>{weddingConfigEn.invitation.message}</Message>
        <Names>
          {weddingConfigEn.invitation.couple.groom} & {weddingConfigEn.invitation.couple.bride}
        </Names>
      </Section>

      <Section $beige>
        <SectionTitle>Date</SectionTitle>
        <Paragraph>
          {eventDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: weddingConfigEn.date.timezone,
            timeZoneName: 'short',
          })}
        </Paragraph>
        <Paragraph>{countdownText}</Paragraph>
      </Section>

      <Section>
        <SectionTitle>Venue</SectionTitle>
        <Paragraph>{weddingConfigEn.venue.name}</Paragraph>
        <Message>{weddingConfigEn.venue.address}</Message>
        <Paragraph>{weddingConfigEn.venue.tel}</Paragraph>
        <SmallTitle>Transportation</SmallTitle>
        <Message>{weddingConfigEn.venue.transportation.subway}</Message>
        <Message>{weddingConfigEn.venue.transportation.bus}</Message>
        <Paragraph>{weddingConfigEn.venue.parking}</Paragraph>
        <ButtonRow>
          <NavButton type="button" onClick={navigateToNaver}>
            Open in Naver Map
          </NavButton>
          <NavButton type="button" onClick={navigateToKakao}>
            Open in Kakao Map
          </NavButton>
        </ButtonRow>
      </Section>

      <Section $beige>
        <SectionTitle>RSVP</SectionTitle>
        <Message>
          Please let us know if you can join us.
          {'\n'}
          We truly appreciate your response.
        </Message>
        {submitMessage && <Status $success={submitMessage.success}>{submitMessage.message}</Status>}
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Row>
            <Select
              value={formData.side}
              onChange={(e) => setFormData((prev) => ({ ...prev, side: e.target.value as Side }))}
              required
            >
              <option value="">Select side</option>
              <option value="GROOM">Groom side</option>
              <option value="BRIDE">Bride side</option>
            </Select>

            <Select
              value={formData.isAttending === null ? '' : formData.isAttending ? 'yes' : 'no'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isAttending: e.target.value === '' ? null : e.target.value === 'yes',
                  guestCount: e.target.value === 'yes' ? prev.guestCount : 0,
                  hasMeal: e.target.value === 'yes' ? prev.hasMeal : null,
                }))
              }
              required
            >
              <option value="">Attendance</option>
              <option value="yes">Attending</option>
              <option value="no">Not attending</option>
            </Select>
          </Row>

          {formData.isAttending && (
            <Row>
              <Select
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, guestCount: Number.parseInt(e.target.value, 10) }))
                }
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} guest{num > 1 ? 's' : ''}
                  </option>
                ))}
              </Select>

              {weddingConfigEn.rsvp.showMealOption && (
                <Select
                  value={formData.hasMeal === null ? '' : formData.hasMeal ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasMeal: e.target.value === '' ? null : e.target.value === 'yes',
                    }))
                  }
                >
                  <option value="">Meal preference</option>
                  <option value="yes">Will dine</option>
                  <option value="no">Will not dine</option>
                </Select>
              )}
            </Row>
          )}

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Send RSVP'}
          </SubmitButton>
        </Form>
      </Section>

      <Section>
        <SectionTitle>Gallery</SectionTitle>
        {isGalleryLoading && <Paragraph>Loading images...</Paragraph>}
        {!isGalleryLoading && galleryError && <Paragraph>{galleryError}</Paragraph>}
        {!isGalleryLoading && !galleryError && (
          <GalleryGrid>
            {galleryImages.map((image, idx) => (
              <GalleryItem key={`${image}-${idx}`} onClick={() => setExpandedImage(image)}>
                <GalleryImage
                  src={image}
                  alt={`Wedding gallery ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </GalleryItem>
            ))}
          </GalleryGrid>
        )}
      </Section>

      {expandedImage && (
        <ExpandedImageOverlay onClick={() => setExpandedImage(null)} aria-modal="true" role="dialog">
          <ExpandedImageContainer onClick={(e) => e.stopPropagation()}>
            <ExpandedImageWrapper>
              <Image
                src={expandedImage}
                alt="Expanded wedding gallery image"
                fill
                sizes="90vw"
                style={{ objectFit: 'contain' }}
              />
            </ExpandedImageWrapper>
            <CloseButton type="button" onClick={() => setExpandedImage(null)} aria-label="Close">
              ×
            </CloseButton>
          </ExpandedImageContainer>
        </ExpandedImageOverlay>
      )}
    </Main>
  );
};

const Main = styled.main`
  color: #222;
`;

const Hero = styled.section`
  position: relative;
  height: 100vh;
  min-height: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
`;

const HeroImage = styled(Image)`
  z-index: 0;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 0 1rem;
`;

const HeroTitle = styled.h1`
  font-family: 'PlayfairDisplay', 'Times New Roman', serif;
  font-style: italic;
  font-size: clamp(2rem, 7vw, 3rem);
  font-weight: 400;
`;

const HeroText = styled.p`
  margin-top: 0.5rem;
  font-size: clamp(1rem, 3.6vw, 1.2rem);
`;

const Section = styled.section<{ $beige?: boolean }>`
  padding: 4rem 1.5rem;
  text-align: center;
  background: ${({ $beige }) => ($beige ? '#f8f6f2' : '#fff')};
`;

const SectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const SmallTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.7rem;
  font-size: 1rem;
`;

const Message = styled.p`
  white-space: pre-line;
  line-height: 1.8;
  max-width: 40rem;
  margin: 0.5rem auto;
`;

const Paragraph = styled.p`
  margin: 0.5rem auto;
  line-height: 1.7;
`;

const Names = styled.p`
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const NavButton = styled.button`
  padding: 0.7rem 1rem;
  border: 1px solid #d9d0c5;
  background: #fff;
  border-radius: 999px;
  cursor: pointer;
`;

const Form = styled.form`
  max-width: 40rem;
  margin: 1.5rem auto 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  background: #c9b39d;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Status = styled.p<{ $success: boolean }>`
  max-width: 40rem;
  margin: 0 auto 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  color: ${({ $success }) => ($success ? '#1b5e20' : '#b71c1c')};
  background: ${({ $success }) => ($success ? '#e8f5e9' : '#ffebee')};
`;

const GalleryGrid = styled.div`
  max-width: 56rem;
  margin: 0 auto;
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
  cursor: pointer;
`;

const GalleryImage = styled(Image)`
  display: block;
`;

const ExpandedImageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExpandedImageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExpandedImageWrapper = styled.div`
  position: relative;
  width: 90vw;
  height: 90vh;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background-color: #c9b39d;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
`;

export default HomeEn;
