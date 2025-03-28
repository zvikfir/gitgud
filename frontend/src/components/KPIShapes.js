import { keyframes, styled, css } from '@mui/system';
import { COLORS } from '../constants/colors';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.3; }
`;

const BaseShape = styled('div')`
  ${({ size = 40, animated, delay }) => css`
    width: ${size}px;
    height: ${size}px;
    opacity: 0.9;
    transition: transform 0.2s;
    &:hover {
      /*transform: scale(1.1);*/
    }
    ${animated ? css`
      animation: ${pulse} 1.5s ease-in-out infinite;
      animation-delay: ${delay}s;
    ` : ''}
  `}
`;

export const BestPracticesKPI = styled(BaseShape)`
  ${({ size = 40 }) => `
    width: ${size}px;
    height: ${size}px;
    background-color: ${COLORS.bestPractices};
    border-radius: 50%;
  `}
`;

export const ComplianceKPI = styled(BaseShape)`
  background-color: ${COLORS.compliance};
`;

export const ResilienceKPI = styled(BaseShape)`
  ${({ size = 40 }) => `
    width: ${size * 0.95}px;
    height: ${size * 0.55}px;
    background-color: ${COLORS.resilience};
    position: relative;
    
    &:before, &:after {
      content: '';
      position: absolute;
      width: 0;
      border-left: ${size * 0.475}px solid transparent;
      border-right: ${size * 0.475}px solid transparent;
    }
    &:before {
      bottom: 100%;
      border-bottom: ${size * 0.275}px solid ${COLORS.resilience};
    }
    &:after {
      top: 100%;
      border-top: ${size * 0.275}px solid ${COLORS.resilience};
    }
  `}
`;