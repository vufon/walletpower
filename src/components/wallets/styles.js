// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import styled from 'styled-components';

export const WalletsList = styled.div`
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    gap: 12px;
    color: ${props => props.theme.contrast};
    box-sizing: border-box;
    *,
    *:before,
    *:after {
        box-sizing: inherit;
    }
`;

export const WalletsPanel = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
    width: 100%;
    background-color: ${props => props.theme.panel};
    border: 1px solid #383f4b;
    border-radius: 9px;
    margin-bottom: 12px;
`;
export const Wallet = styled.div`
    display: flex;
    flex-direction: column;
    border-top: 0.5px solid ${props => props.theme.separator};
    gap: 0 12px;
    padding: 6px 0;
`;
export const WalletRow = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
`;

export const WalletButtonRow = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
`;
export const ActionsRow = styled.div``;

export const WalletName = styled.div`
    display: flex;
    text-align: left;
    word-break: break-word;
    font-size: 19px;
`;

export const ActiveWalletName = styled(WalletName)`
    font-weight: bold;
    font-size: 19px;
    color: ${props => props.theme.eCashBlue};
`;

export const SvgButtonPanel = styled.div`
    display: flex;
    align-items: baseline;
`;
export const ButtonPanel = styled.div`
    display: flex;
    gap: 9px;
    align-items: center;
    justify-content: center;
`;

export const WalletBalance = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    word-wrap: break-word;
    font-size: 18px;
    hyphens: auto;
`;

export const ActivateButton = styled.button`
    cursor: pointer;
    color: ${props => props.theme.eCashBlue};
    border-radius: 9px;
    border: 2px solid ${props => props.theme.eCashBlue};
    background: transparent;
    font-size: 19px;
    :hover {
        background-color: ${props => props.theme.eCashBlue};
        color: ${props => props.theme.contrast};
    }
`;
