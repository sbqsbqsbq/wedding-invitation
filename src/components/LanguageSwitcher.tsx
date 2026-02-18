'use client';

import Link from 'next/link';
import styled from 'styled-components';

interface LanguageSwitcherProps {
  current: 'ko' | 'en';
}

const LanguageSwitcher = ({ current }: LanguageSwitcherProps) => {
  return (
    <Wrapper aria-label="language switcher">
      <LanguageLink href="/" $active={current === 'ko'}>
        KR
      </LanguageLink>
      <Divider>|</Divider>
      <LanguageLink href="/en" $active={current === 'en'}>
        EN
      </LanguageLink>
    </Wrapper>
  );
};

const Wrapper = styled.nav`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  backdrop-filter: blur(4px);
  font-size: 0.8rem;
`;

const LanguageLink = styled(Link)<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#111' : '#777')};
  text-decoration: none;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
`;

const Divider = styled.span`
  margin: 0 0.45rem;
  color: #999;
`;

export default LanguageSwitcher;
