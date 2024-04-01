// @ts-strict-ignore
import React, { useState } from 'react';

import { toRelaxedNumber } from 'loot-core/src/shared/util';

import { useAccounts } from '../../hooks/useAccounts';
import { type BoundActions } from '../../hooks/useActions';
import { useNavigate } from '../../hooks/useNavigate';
import { theme } from '../../style';
import { Button } from '../common/Button';
import { ExternalLink } from '../common/ExternalLink';
import { FormError } from '../common/FormError';
import { InitialFocus } from '../common/InitialFocus';
import { InlineField } from '../common/InlineField';
import { Input } from '../common/Input';
import { Modal, ModalButtons } from '../common/Modal';
import { Text } from '../common/Text';
import { View } from '../common/View';
import { Checkbox } from '../forms';
import { type CommonModalProps } from '../Modals';

enum NameError {
  NONE,
  EMPTY,
  DUPLICATE,
}

type CreateLocalAccountProps = {
  modalProps: CommonModalProps;
  actions: BoundActions;
};

export function CreateLocalAccount({
  modalProps,
  actions,
}: CreateLocalAccountProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [offbudget, setOffbudget] = useState(false);
  const [balance, setBalance] = useState('0');

  const [nameError, setNameError] = useState(NameError.NONE);
  const [balanceError, setBalanceError] = useState(false);
  const accounts = useAccounts();

  const validateBalance = balance => !isNaN(parseFloat(balance));
  const validateAccountNameIsUnique = (newName: string) => {
    return accounts.findIndex(a => a.name === newName) === -1;
  };

  return (
    <Modal title="Create Local Account" {...modalProps}>
      {() => (
        <View>
          <form
            onSubmit={async event => {
              event.preventDefault();

              let nameError = NameError.NONE;
              if (!name) {
                nameError = NameError.EMPTY;
                setNameError(nameError);
              } else if (!validateAccountNameIsUnique(name)) {
                nameError = NameError.DUPLICATE;
                setNameError(nameError);
              }

              const balanceError = !validateBalance(balance);
              setBalanceError(balanceError);

              if (nameError === NameError.NONE && !balanceError) {
                actions.closeModal();
                const id = await actions.createAccount(
                  name,
                  toRelaxedNumber(balance),
                  offbudget,
                );
                navigate('/accounts/' + id);
              }
            }}
          >
            <InlineField label="Name" width="75%">
              <InitialFocus>
                <Input
                  name="name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  onBlur={event => {
                    const name = event.target.value.trim();
                    setName(name);
                    if (name && nameError !== NameError.NONE) {
                      setNameError(NameError.NONE);
                    }
                  }}
                  style={{ flex: 1 }}
                />
              </InitialFocus>
            </InlineField>
            {(nameError === NameError.EMPTY && (
              <FormError style={{ marginLeft: 75 }}>Name is required</FormError>
            )) ||
              (nameError === NameError.DUPLICATE && (
                <FormError style={{ marginLeft: 75 }}>
                  Duplicate name is not allowed
                </FormError>
              ))}

            <View
              style={{
                width: '75%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <View style={{ flexDirection: 'column' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Checkbox
                    id="offbudget"
                    name="offbudget"
                    checked={offbudget}
                    onChange={() => setOffbudget(!offbudget)}
                  />
                  <label
                    htmlFor="offbudget"
                    style={{
                      userSelect: 'none',
                      verticalAlign: 'center',
                    }}
                  >
                    Off-budget
                  </label>
                </View>
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '0.7em',
                    color: theme.pageTextLight,
                    marginTop: 3,
                  }}
                >
                  <Text>
                    This cannot be changed later. <br /> {'\n'}
                    See{' '}
                    <ExternalLink
                      linkColor="muted"
                      to="https://actualbudget.org/docs/accounts/#off-budget-accounts"
                    >
                      Accounts Overview
                    </ExternalLink>{' '}
                    for more information.
                  </Text>
                </div>
              </View>
            </View>

            <InlineField label="Balance" width="75%">
              <Input
                name="balance"
                inputMode="decimal"
                value={balance}
                onChange={event => setBalance(event.target.value)}
                onBlur={event => {
                  const balance = event.target.value.trim();
                  setBalance(balance);
                  if (validateBalance(balance) && balanceError) {
                    setBalanceError(false);
                  }
                }}
                style={{ flex: 1 }}
              />
            </InlineField>
            {balanceError && (
              <FormError style={{ marginLeft: 75 }}>
                Balance must be a number
              </FormError>
            )}

            <ModalButtons>
              <Button onClick={() => modalProps.onBack()}>Back</Button>
              <Button type="primary" style={{ marginLeft: 10 }}>
                Create
              </Button>
            </ModalButtons>
          </form>
        </View>
      )}
    </Modal>
  );
}
