"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseIntOrNull, pluralHelper } from "@/lib/utils";

import { Block } from "@/lib/types";
import { BlockClaims } from "./clientPage";
import { BlocksState } from "@/actions/claim";
import { ComboBox } from "@/components/ui/combobox";
import { Either } from "@/lib/utilityTypes";
import { configuration } from "@/configuration/configuration";
import { getBlockName } from "@/validation/block";

type BlockElementProps = {
    block: BlocksState[Block["id"]];
    claims: BlockClaims[Block["id"]];
    onClaimsChange: (claims: BlockClaims[Block["id"]]) => void;
    disabled?: boolean;
} & Either<
    {},
    {
        admin: true;
        eventId: number | null;
        events: {
            id: number;
            name: string;
        }[];
        onEventChane: (eventId: number | null) => void;
    }
>;

const BlockElement = ({
    block,
    claims,
    onClaimsChange,
    disabled,
    admin,
    eventId,
    events,
    onEventChane,
}: BlockElementProps) => {
    return (
        <Card key={block.id}>
            <CardHeader>
                <CardTitle>{getBlockName(block)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-stretch gap-4">
                {configuration.secondaryClaims && (
                    <b className="-mb-3">Primární přednáška</b>
                )}
                <ComboBox
                    readonly={disabled}
                    placeholder={
                        admin
                            ? "Nic"
                            : configuration.secondaryClaims
                              ? "Prosím vyberte primární přednášku"
                              : "Prosím vyberte přednášku"
                    }
                    className="w-auto"
                    value={claims.primary?.toString()}
                    onChange={(value) => {
                        const id = parseIntOrNull(value);

                        onClaimsChange({
                            primary: id,
                            secondary:
                                claims.secondary !== id
                                    ? claims.secondary
                                    : null,
                        });
                    }}
                    values={[
                        ...(admin
                            ? [
                                  {
                                      value: "none",
                                      label: "Nic",
                                  },
                              ]
                            : []),
                        ...block.archetypes
                            .filter(
                                (a) =>
                                    a.spaceLeft > 0 ||
                                    a.id === claims.primary ||
                                    admin,
                            )
                            .map((a) => ({
                                value: a.id.toString(),
                                label: `${a.name} - ${pluralHelper(Math.max(a.spaceLeft, 0), "zbývá", "zbývají", "zbývá")} ${Math.max(a.spaceLeft, 0)} ${pluralHelper(Math.max(a.spaceLeft, 0), "místo", "místa", "míst")}`,
                            })),
                    ]}
                />
                {configuration.secondaryClaims && (
                    <>
                        <b className="-mb-3">Sekundární přednáška</b>
                        <ComboBox
                            readonly={disabled}
                            placeholder={
                                admin
                                    ? "Nic"
                                    : "Prosím vyberte sekundární přednášku"
                            }
                            className="w-auto"
                            value={claims.secondary?.toString()}
                            onChange={(value) => {
                                onClaimsChange({
                                    primary: claims?.primary,
                                    secondary: parseIntOrNull(value),
                                });
                            }}
                            values={[
                                ...(admin
                                    ? [
                                          {
                                              value: "none",
                                              label: "Nic",
                                          },
                                      ]
                                    : []),
                                ...block.archetypes
                                    .filter(
                                        (a) =>
                                            a.id !==
                                            (claims?.primary ??
                                                block.primaryClaim),
                                    )
                                    .map((a) => ({
                                        value: a.id.toString(),
                                        label: a.name,
                                    })),
                            ]}
                        />
                    </>
                )}
                {admin && (
                    <>
                        <b className="-mb-3">Rozřazení</b>
                        <ComboBox
                            placeholder={"Žádné"}
                            className="w-auto"
                            value={eventId?.toString() ?? "none"}
                            onChange={(value) =>
                                onEventChane(parseIntOrNull(value))
                            }
                            values={[
                                {
                                    value: "none",
                                    label: "Žádné",
                                },
                                ...(events ?? []).map((e) => ({
                                    value: e.id.toString(),
                                    label: e.name,
                                })),
                            ]}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default BlockElement;
