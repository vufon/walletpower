// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from 'react';
import {
    TrashcanIcon,
    EditIcon,
    SyncIcon,
} from '../common/CustomIcons';
import {
    IconButton,
    CopyIconButton,
} from '../common/Buttons';
import {
    WalletsList,
    WalletsPanel,
    Wallet,
    WalletRow,
    ActionsRow,
    ActiveWalletName,
    WalletName,
    ButtonPanel,
    SvgButtonPanel,
    WalletBalance,
    ActivateButton,
} from './styles';
import * as bip39 from 'bip39';
import * as randomBytes from 'randombytes';
import { getWalletsForNewActiveWallet, syncDecredWalletData } from '../../wallet/index'
import { WalletContext } from '../../wallet/context';
import { toast } from 'react-toastify';
import { toFormattedXec } from '../../utils/formatting';
import { getUserLocale } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import { getWalletNameError, validateMnemonic } from '../../validation';
import { CurrencyOption, ModalInput } from '../../components/common/Inputs';
import debounce from 'lodash.debounce';
import { DerivationPath } from '../../utils/const';
import * as Decred from 'decredjs-lib'
import { HomeBackupArea } from '../Home';

//TODO: 
export const generateMnemonic = (seedType) => {
    if (seedType == 17 || seedType == 33) {
        return Decred.Mnemonic._mnemonic(seedType == 17 ? 128 : 256, Decred.Mnemonic.Words.ENGLISH)
    }
    return generateBip39Mnemonic(seedType)
};

export const generateBip39Mnemonic = (seedType) => {
    return bip39.generateMnemonic(
        seedType == 12 ? 128 : 256,
        randomBytes,
        bip39.wordlists['english'],
    );
};

const Wallets = () => {
    const ContextValue = React.useContext(WalletContext);
    const { updateDecredState, decredState } = ContextValue;
    const { wallets } = decredState;
    const emptyFormDataErrors = {
        renamedWalletName: false,
        walletToBeDeletedName: false,
        newWalletName: false,
        mnemonic: false,
    };
    const emptyFormData = {
        renamedWalletName: '',
        walletToBeDeletedName: '',
        newWalletName: '',
        mnemonic: '',
    };
    const [formData, setFormData] = useState(emptyFormData);
    const [formDataErrors, setFormDataErrors] = useState(emptyFormDataErrors);
    const [walletToBeDeleted, setWalletToBeDeleted] = useState(null);
    const [walletToBeRenamed, setWalletToBeRenamed] = useState(null);
    const userLocale = getUserLocale(navigator);

    const handleInput = e => {
        const { name, value } = e.target;

        if (name === 'renamedWalletName') {
            setFormDataErrors(previous => ({
                ...previous,
                [name]: getWalletNameError(value, wallets),
            }));
        }
        if (name === 'walletToBeDeletedName') {
            const walletToBeDeletedNameError =
                value === 'delete ' + walletToBeDeleted.name
                    ? false
                    : `Input must exactly match "delete ${walletToBeDeleted.name}"`;
            setFormDataErrors(previous => ({
                ...previous,
                [name]: walletToBeDeletedNameError,
            }));
        }
        if (name === 'mnemonic') {
            setFormDataErrors(previous => ({
                ...previous,
                [name]:
                    validateMnemonic(value) === true
                        ? false
                        : 'Invalid mnemonic',
            }));
        }
        setFormData(previous => ({
            ...previous,
            [name]: value,
        }));
    };

    const renameWallet = async () => {
        // Find the wallet you want to rename
        let walletToUpdate = wallets.find(
            wallet => wallet.mnemonic === walletToBeRenamed.mnemonic,
        );
        const oldName = walletToUpdate.name;

        // if a match was found
        if (typeof walletToUpdate !== 'undefined') {
            // update the walllet name
            walletToUpdate.name = formData.renamedWalletName;

            // Update localforage and state
            await updateDecredState('wallets', wallets);
            toast.success(
                `"${oldName}" renamed to "${formData.renamedWalletName}"`,
            );
        } else {
            toast.error(`Unable to find wallet ${walletToBeRenamed.name}`);
        }
        // Clear walletToBeRenamed field to hide the modal
        setWalletToBeRenamed(null);

        // Clear wallet rename input
        setFormData(previous => ({
            ...previous,
            renamedWalletName: '',
        }));
    };

    const deleteWallet = async () => {
        // filter wallet from wallets
        const updatedWallets = wallets.filter(
            wallet => wallet.mnemonic !== walletToBeDeleted.mnemonic,
        );

        // Update localforage and state
        await updateDecredState('wallets', updatedWallets);
        toast.success(`"${walletToBeDeleted.name}" deleted`);

        // Reset walletToBeDeleted to hide the modal
        setWalletToBeDeleted(null);

        // Clear wallet to delete input
        setFormData(previous => ({
            ...previous,
            walletToBeDeletedName: '',
        }));
    };

    const syncWalletData = async wallet => {
        wallet.syncWallet = false
        await syncDecredWalletData(wallet, wallets, updateDecredState)
        wallet.syncPercent = 100
        updateDecredState('wallets', [
            wallet,
            ...wallets.slice(1),
        ]);
    }

    const activateWallet = (walletToActivate, wallets) => {
        // Get desired wallets array after activating walletToActivate
        const walletsAfterActivation = getWalletsForNewActiveWallet(
            walletToActivate,
            wallets,
        );

        // Event("Category", "Action", "Label")
        // Track number of times a different wallet is activated
        //  Event('Configure.js', 'Activate', '');

        // Update wallets to activate this wallet
        updateDecredState('wallets', walletsAfterActivation);
    };
    const seedTypeMenuOptions = [];
    seedTypeMenuOptions.push({
        label: '12-words seed',
        value: 12,
    })
    seedTypeMenuOptions.push({
        label: '17-words seed',
        value: 17,
    })
    seedTypeMenuOptions.push({
        label: '24-words seed',
        value: 24,
    })
    seedTypeMenuOptions.push({
        label: '33-words seed',
        value: 33,
    })
    const seedTypeOptions = seedTypeMenuOptions.map(menuOption => {
        return (
            <CurrencyOption
                key={menuOption.value}
                value={menuOption.value}
                data-testid={menuOption.value}
            >
                {menuOption.label}
            </CurrencyOption>
        );
    });

    return (
        <>
            {walletToBeRenamed !== null && (
                <Modal
                    height={180}
                    title={`Rename "${walletToBeRenamed.name}"?`}
                    handleOk={renameWallet}
                    handleCancel={() => setWalletToBeRenamed(null)}
                    showCancelButton
                    disabled={
                        formDataErrors.renamedWalletName !== false ||
                        formData.renamedWalletName === ''
                    }
                >
                    <ModalInput
                        placeholder="Enter new wallet name"
                        name="renamedWalletName"
                        value={formData.renamedWalletName}
                        error={formDataErrors.renamedWalletName}
                        handleInput={handleInput}
                    />
                </Modal>
            )}
            {walletToBeDeleted !== null && (
                <Modal
                    height={210}
                    title={`Delete "${walletToBeDeleted.name}"?`}
                    handleOk={deleteWallet}
                    handleCancel={() => setWalletToBeDeleted(null)}
                    showCancelButton
                    disabled={
                        formDataErrors.walletToBeDeletedName !== false ||
                        formData.walletToBeDeletedName === ''
                    }
                >
                    <ModalInput
                        placeholder={`Type "delete ${walletToBeDeleted.name}" to confirm`}
                        name="walletToBeDeletedName"
                        value={formData.walletToBeDeletedName}
                        handleInput={handleInput}
                        error={formDataErrors.walletToBeDeletedName}
                    />
                </Modal>
            )}
            <HomeBackupArea>
                <WalletsList title="Wallets">
                    <WalletsPanel>
                        {wallets.map((wallet, index) =>
                            index === 0 ? (
                                <WalletRow key={`${wallet.name}_${index}`}>
                                    <ActiveWalletName className="notranslate">
                                        {wallet.name}
                                    </ActiveWalletName>
                                    <h4 className='fs-18'>(active)</h4>
                                    <SvgButtonPanel>
                                        <CopyIconButton
                                            name={`Copy address of ${wallet.name}`}
                                            data={wallet.paths[DerivationPath()].address}
                                            showToast
                                        />
                                        <IconButton
                                            name={`Rename ${wallet.name}`}
                                            icon={<EditIcon />}
                                            onClick={() =>
                                                setWalletToBeRenamed(wallet)
                                            }
                                        />
                                        <IconButton
                                            name={`Sync ${wallet.name} wallet data`}
                                            icon={<SyncIcon />}
                                            onClick={() =>
                                                syncWalletData(wallet)
                                            }
                                        />
                                    </SvgButtonPanel>
                                </WalletRow>
                            ) : (
                                <Wallet key={`${wallet.name}_${index}`}>
                                    <WalletRow>
                                        <WalletName>
                                            <h3 className="overflow notranslate fs-19">
                                                {wallet.name}
                                            </h3>
                                        </WalletName>
                                        <WalletBalance>
                                            {wallet?.state?.balanceSats !== 0
                                                ? `${toFormattedXec(
                                                    wallet.state.balanceSats,
                                                    userLocale,
                                                )} DCR`
                                                : '-'}
                                        </WalletBalance>
                                    </WalletRow>
                                    <ActionsRow>
                                        <ButtonPanel>
                                            <SvgButtonPanel>
                                                <CopyIconButton
                                                    name={`Copy address of ${wallet.name}`}
                                                    data={wallet.paths[DerivationPath()].address}
                                                    showToast
                                                />
                                                <IconButton
                                                    name={`Rename ${wallet.name}`}
                                                    icon={<EditIcon />}
                                                    onClick={() =>
                                                        setWalletToBeRenamed(wallet)
                                                    }
                                                />
                                                <IconButton
                                                    name={`Delete ${wallet.name}`}
                                                    icon={<TrashcanIcon />}
                                                    onClick={() =>
                                                        setWalletToBeDeleted(wallet)
                                                    }
                                                />
                                            </SvgButtonPanel>
                                            <ActivateButton
                                                aria-label={`Activate ${wallet.name}`}
                                                onClick={debounce(
                                                    () =>
                                                        activateWallet(
                                                            wallet,
                                                            wallets,
                                                        ),
                                                    500,
                                                )}
                                            >
                                                Activate
                                            </ActivateButton>
                                        </ButtonPanel>
                                    </ActionsRow>
                                </Wallet>
                            ),
                        )}
                    </WalletsPanel>
                </WalletsList>
            </HomeBackupArea>
        </>
    );
};

export default Wallets;
