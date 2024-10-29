CREATE VIEW po_view AS 
(select po.po_id AS po_id,
 concat('PO-',po.po_id) AS po_number_view,
 supplier.supplier_name AS supplier_name,
 concat(category.category,'-',product.product_id,' / ',product.product_description) AS product_view,
 po.quantity_ordered AS quantity_ordered,
 po.unit_price AS unit_price,
 date_format(po.due_date,'%Y-%m-%d') AS due_date_view,
 po.quantity_received AS quantity_received,
 po.remarks AS remarks
 from po 
 join supplier on supplier.supplier_id = po.supplier_id
 join product on product.product_id = po.product_id
 join category on category.category_id = product.category_id
);