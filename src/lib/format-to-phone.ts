

export const formatToPhone = (v: string) => {
    v = v.replace(/\D/g, '');

    if (v.length == 13 && v.slice(0, 2) == '55') v = v.slice(2)

    if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else if (v.length === 11) {
        v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
    } else if (v.length === 13) {
        v = v.replace(/^(\d{2})(\d{2})(\d{1})(\d{4})(\d{4})$/, '$1 ($2) $3 $4-$5');

    } else {
        // Formatação para números com mais de 11 dígitos
        v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})(\d{0,4})$/, '($1) $2 $3-$4$5');
    }

    return v;
};
