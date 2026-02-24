'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchGuestbookEntries, submitGuestbookEntry } from '../../lib/guestbook-client';

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  locale: 'ko' | 'en';
  createdAt: string;
}

interface GuestbookSectionProps {
  bgColor?: 'white' | 'beige';
}

const GuestbookSection = ({ bgColor = 'white' }: GuestbookSectionProps) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const items = await fetchGuestbookEntries(20);
        setEntries(items);
      } catch {
        setStatus({ success: false, message: '방명록을 불러오지 못했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !message.trim()) {
      setStatus({ success: false, message: '이름과 메시지를 모두 입력해 주세요.' });
      return;
    }

    setSubmitting(true);
    try {
      const entry = await submitGuestbookEntry({
        name,
        message,
        locale: 'ko',
      });

      setEntries((prev) => [entry, ...prev].slice(0, 20));
      setName('');
      setMessage('');
      setStatus({ success: true, message: '방명록이 등록되었습니다. 감사합니다.' });
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : '방명록 등록 중 오류가 발생했습니다.';
      setStatus({ success: false, message: messageText });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer $bgColor={bgColor}>
      <SectionTitle>방명록</SectionTitle>
      <Description>
        축하와 응원의 한마디를 남겨주세요.
        <br />
        남겨주신 마음을 소중히 간직하겠습니다.
      </Description>

      {status && <StatusMessage $success={status.success}>{status.message}</StatusMessage>}

      <Form onSubmit={onSubmit}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={20}
          placeholder="이름"
          required
        />
        <TextArea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={300}
          placeholder="메시지를 남겨주세요"
          rows={4}
          required
        />
        <SubmitButton type="submit" disabled={submitting}>
          {submitting ? '등록 중...' : '남기기'}
        </SubmitButton>
      </Form>

      <ListTitle>최근 메시지</ListTitle>
      {loading && <HelperText>불러오는 중...</HelperText>}
      {!loading && entries.length === 0 && <HelperText>아직 등록된 메시지가 없습니다.</HelperText>}
      {!loading && entries.length > 0 && (
        <EntryList>
          {entries.map((entry) => (
            <EntryCard key={entry.id}>
              <EntryMeta>
                <strong>{entry.name}</strong>
                <span>
                  {new Date(entry.createdAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Seoul',
                  })}
                </span>
              </EntryMeta>
              <EntryMessage>{entry.message}</EntryMessage>
            </EntryCard>
          ))}
        </EntryList>
      )}
    </SectionContainer>
  );
};

const SectionContainer = styled.section<{ $bgColor: 'white' | 'beige' }>`
  padding: 4rem 1.5rem;
  text-align: center;
  background-color: ${(props) => (props.$bgColor === 'beige' ? '#f8f6f2' : '#fff')};
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
`;

const Description = styled.p`
  color: #666;
  margin: 0 auto 1.5rem;
  line-height: 1.8;
  max-width: 40rem;
`;

const Form = styled.form`
  max-width: 40rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  margin-top: 0.25rem;
  padding: 0.85rem 1rem;
  background: #c9b39d;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p<{ $success: boolean }>`
  max-width: 40rem;
  margin: 0 auto 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  color: ${({ $success }) => ($success ? '#1b5e20' : '#b71c1c')};
  background: ${({ $success }) => ($success ? '#e8f5e9' : '#ffebee')};
`;

const ListTitle = styled.h3`
  margin: 2rem auto 1rem;
  font-size: 1.1rem;
  color: #444;
  font-weight: 600;
`;

const EntryList = styled.div`
  max-width: 40rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const EntryCard = styled.article`
  text-align: left;
  border: 1px solid #e8dfd5;
  border-radius: 10px;
  padding: 0.9rem;
  background: #fff;
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: baseline;
  margin-bottom: 0.45rem;

  span {
    color: #7d7d7d;
    font-size: 0.82rem;
  }
`;

const EntryMessage = styled.p`
  white-space: pre-line;
  color: #444;
  line-height: 1.6;
`;

const HelperText = styled.p`
  color: #777;
`;

export default GuestbookSection;
