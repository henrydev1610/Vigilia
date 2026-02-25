import React, { memo } from 'react';
import { IconButton, ListItem } from './ui';

interface DeputadoCardProps {
  id: number;
  nome: string;
  partido: string;
  uf: string;
  amountLabel: string;
  imageUri?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onPress: (id: number, nome: string) => void;
}

const DeputadoCardComponent: React.FC<DeputadoCardProps> = ({
  id,
  nome,
  partido,
  uf,
  amountLabel,
  imageUri,
  isFavorite,
  onToggleFavorite,
  onPress,
}) => {
  return (
    <ListItem
      title={nome}
      subtitle={`${partido} • ${uf}`}
      amount={amountLabel}
      imageUri={imageUri}
      trailingIcon="chevron-right"
      rightAction={<IconButton icon={isFavorite ? 'star' : 'star-outline'} onPress={() => onToggleFavorite(id)} />}
      onPress={() => onPress(id, nome)}
    />
  );
};

export const DeputadoCard = memo(DeputadoCardComponent);
